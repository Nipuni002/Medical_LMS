# Theory Content Management Guide

## Overview

This system allows admins to add detailed content and video links to theory subjects like "Ethics, Law & Communication". Students can then view this content in an organized, topic-by-topic format with embedded videos.

## Features

### For Admins
- Add detailed content to any theory subject
- Create multiple topics within each subject
- Add video links (YouTube, Vimeo, etc.) to topics
- Reorder topics with up/down arrows
- Publish/unpublish content
- Rich text formatting support

### For Students
- View organized theory content
- Watch embedded videos
- Navigate between topics easily
- Topic-by-topic learning experience

## Setup Instructions

### 1. Create Theory Subjects First

Before adding content, you need to have theory subjects created:

1. Go to Admin Dashboard → **Manage Theory Subjects**
2. Add subjects like "Ethics, Law & Communication"
3. Set weightage (Very High, High, Moderate, Low)
4. Choose a color for the subject

### 2. Add Content to Subjects

1. Go to Admin Dashboard → **Manage Theory Content**
2. Select a subject from the dropdown
3. Fill in the basic information:
   - **Title**: Display name for the content
   - **Description**: Brief overview
   - **Published**: Toggle to show/hide from students

4. Add topics:
   - Click **"+ Add Topic"**
   - Enter topic title (e.g., "Consent and Capacity")
   - Write detailed content
   - Add video link (optional)
   - Reorder topics using ↑↓ buttons
   - Remove topics with ✕ button

5. Click **"Create Content"** or **"Update Content"**

## Video Link Formats

### Supported Platforms

#### YouTube
- Full URL: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URL: `https://youtu.be/VIDEO_ID`

#### Vimeo
- Standard URL: `https://vimeo.com/VIDEO_ID`

Videos will be automatically embedded in the player. Other video platforms will show a direct link.

## Using the Seed File (Optional)

We've provided a sample seed file with Ethics, Law & Communication content:

```bash
cd server
node seeds/seedEthicsContent.js
```

**Prerequisites:**
- The "Ethics, Law & Communication" subject must exist
- An admin user must be created

## Student View

When students click on a theory subject:

1. They see the subject header with:
   - Weightage badge
   - Subject title and description
   - Number of topics

2. Left sidebar shows:
   - List of all topics
   - Video indicator (🎥) for topics with videos
   - Active topic highlighting

3. Main content area displays:
   - Topic title
   - Embedded video player (if video link provided)
   - Topic content
   - Previous/Next navigation buttons

## Routes

### Admin Routes
- `/admin/theory-subjects` - Manage subjects
- `/admin/theory-content` - Manage content

### Student Routes
- `/plab/plab1/theory` - List all theory subjects
- `/theory/:subjectId` - View subject content

## API Endpoints

### Get Content for Subject
```
GET /api/plab-theory-content/subject/:subjectId
```

### Create Content
```
POST /api/plab-theory-content
Authorization: Bearer TOKEN
Body: {
  subjectId, title, description, topics, isPublished
}
```

### Update Content
```
PUT /api/plab-theory-content/:id
Authorization: Bearer TOKEN
Body: {
  title, description, topics, isPublished
}
```

### Delete Content
```
DELETE /api/plab-theory-content/:id
Authorization: Bearer TOKEN
```

## Tips for Content Creation

### Writing Topics
1. **Use clear headings**: Make topic titles descriptive
2. **Structure content**: Use bullet points, numbered lists
3. **Keep paragraphs short**: Easier to read on screen
4. **Add examples**: Clinical scenarios help understanding
5. **Include key points**: Highlight important information

### Video Selection
1. Choose high-quality educational videos
2. Verify video links before saving
3. Prefer videos that complement the written content
4. Consider video length (10-20 minutes ideal)
5. Update broken links regularly

### Content Organization
1. Order topics logically (basics to advanced)
2. Group related concepts together
3. Use consistent formatting
4. Review content for accuracy
5. Update regularly with new guidelines

## Troubleshooting

### Content Not Showing
- Check if content is published (toggle switch)
- Verify subject has isActive = true
- Check browser console for errors

### Video Not Embedding
- Verify URL format is correct
- Check if video is publicly available
- Try direct link if embed doesn't work

### Cannot Create Content
- Ensure you're logged in as admin
- Check if content already exists for that subject
- Verify subject ID is valid

## Database Models

### PlabTheoryContent Schema
```javascript
{
  subjectId: ObjectId (ref: PlabTheorySubject),
  title: String,
  description: String,
  topics: [{
    title: String,
    content: String,
    videoLink: String,
    order: Number
  }],
  isPublished: Boolean,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  timestamps: true
}
```

## Best Practices

1. **Regular Updates**: Keep content current with latest guidelines
2. **Review Process**: Have content reviewed before publishing
3. **Student Feedback**: Collect feedback on content quality
4. **Analytics**: Track which topics are most viewed
5. **Backup**: Regularly backup content before major edits

## Future Enhancements

Potential improvements to consider:
- Rich text editor for formatting
- Image upload support
- PDF attachment support
- Quiz questions per topic
- Progress tracking
- Bookmarking functionality
- Note-taking feature
- Search within content

## Support

For issues or questions:
1. Check this documentation first
2. Review the seed file for examples
3. Check browser console for errors
4. Verify database connections
5. Contact system administrator

---

**Note**: This system is designed to be flexible and can be used for any theory subject, not just Ethics, Law & Communication. The same approach works for all PLAB theory subjects.
