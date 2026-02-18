# PLAB Content Management API

## Overview
Admin-protected API for managing PLAB page content (What is PLAB, Tips, Theory, etc.)

## Setup

### 1. Seed Initial Content
```bash
cd server
node seeds/seedPlabContent.js
```

## API Endpoints

### Public Endpoints

#### Get All Published Content
```
GET /api/plab-content
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "content_id",
      "pageType": "what-is-plab",
      "title": "What is PLAB?",
      "subtitle": "Professional and Linguistic Assessments Board",
      "description": "The Professional and Linguistic Assessments Board...",
      "sections": [
        {
          "heading": "Overview",
          "content": "PLAB is a two-part examination...",
          "order": 1
        }
      ],
      "imageUrl": "/images/PLAB.png",
      "isPublished": true,
      "createdBy": { "name": "Admin User", "email": "admin@example.com" },
      "createdAt": "2026-02-09T...",
      "updatedAt": "2026-02-09T..."
    }
  ]
}
```

#### Get Content by Page Type
```
GET /api/plab-content/:pageType
```

**Page Types:**
- `what-is-plab`
- `plab1-tips`
- `plab2-tips`
- `plab1-theory`
- `plab2-theory`

**Example:**
```bash
curl http://localhost:5000/api/plab-content/what-is-plab
```

---

### Admin Endpoints (Require Authentication)

#### Create New Content
```
POST /api/plab-content
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "pageType": "what-is-plab",
  "title": "What is PLAB?",
  "subtitle": "Professional and Linguistic Assessments Board",
  "description": "Full description text here...",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Section content...",
      "order": 1
    }
  ],
  "imageUrl": "/images/PLAB.png",
  "isPublished": true
}
```

**PowerShell Example:**
```powershell
$token = "your_admin_token_here"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$body = @{
    pageType = "plab1-tips"
    title = "PLAB 1 Tips to Get Ready"
    subtitle = "Complete Guidance for PLAB 1"
    description = "Essential tips and strategies for PLAB 1 preparation..."
    sections = @(
        @{
            heading = "Study Plan"
            content = "Create a structured study plan..."
            order = 1
        }
    )
    isPublished = $true
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri http://localhost:5000/api/plab-content `
    -Method Post `
    -Headers $headers `
    -Body $body
```

#### Update Content by ID
```
PUT /api/plab-content/:id
Authorization: Bearer <admin_token>
```

**Request Body:** (same as create, include only fields to update)
```json
{
  "title": "Updated Title",
  "description": "Updated description..."
}
```

#### Update Content by Page Type
```
PUT /api/plab-content/page/:pageType
Authorization: Bearer <admin_token>
```

**Example:**
```powershell
$token = "your_token"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$body = @{
    title = "What is PLAB? - Updated"
    description = "New description here..."
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/plab-content/page/what-is-plab `
    -Method Put `
    -Headers $headers `
    -Body $body
```

#### Delete Content
```
DELETE /api/plab-content/:id
Authorization: Bearer <admin_token>
```

**Example:**
```powershell
$token = "your_token"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri http://localhost:5000/api/plab-content/content_id `
    -Method Delete `
    -Headers $headers
```

#### Get All Content (Including Unpublished)
```
GET /api/plab-content/admin/all
Authorization: Bearer <admin_token>
```

#### Toggle Publish Status
```
PATCH /api/plab-content/:id/publish
Authorization: Bearer <admin_token>
```

---

## Testing with Admin Token

### 1. Login as Admin
```powershell
$loginBody = @{
    email = "thakshilaperera37@gmail.com"
    password = "AdminN123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login `
    -Method Post `
    -Body $loginBody `
    -ContentType 'application/json'

$token = $response.token
```

### 2. Create Content
```powershell
$headers = @{ 
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$content = @{
    pageType = "what-is-plab"
    title = "What is PLAB?"
    subtitle = "UK Medical Licensing Exam"
    description = "Complete guide to PLAB examination..."
    sections = @(
        @{
            heading = "Overview"
            content = "PLAB consists of two parts..."
            order = 1
        }
    )
    isPublished = $true
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri http://localhost:5000/api/plab-content `
    -Method Post `
    -Headers $headers `
    -Body $content
```

### 3. Get Content
```powershell
# Public access (no auth needed)
Invoke-RestMethod -Uri http://localhost:5000/api/plab-content/what-is-plab
```

### 4. Update Content
```powershell
$updateBody = @{
    title = "Updated PLAB Information"
    description = "New comprehensive description..."
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/plab-content/page/what-is-plab `
    -Method Put `
    -Headers $headers `
    -Body $updateBody
```

### 5. Delete Content
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/plab-content/{content_id}" `
    -Method Delete `
    -Headers $headers
```

---

## Model Structure

### PlabContent Schema
```javascript
{
  pageType: String (unique) // 'what-is-plab', 'plab1-tips', etc.
  title: String (required)
  subtitle: String
  description: String (required)
  sections: [{
    heading: String (required)
    content: String (required)
    order: Number
  }]
  imageUrl: String
  isPublished: Boolean (default: true)
  createdBy: ObjectId (User ref)
  updatedBy: ObjectId (User ref)
  createdAt: Date
  updatedAt: Date
}
```

---

## Security

- ✅ All admin routes protected with JWT authentication
- ✅ Only users with 'admin' role can create/update/delete
- ✅ Public routes only return published content
- ✅ Content tracks who created and updated it
- ✅ Unique pageType prevents duplicates

---

## Error Handling

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Content not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Server error message"
}
```

---

## Usage in Frontend

### Fetch Content in React
```javascript
// Get What is PLAB content
const fetchPlabInfo = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/plab-content/what-is-plab');
    const data = await response.json();
    
    if (data.success) {
      setContent(data.data);
    }
  } catch (error) {
    console.error('Error fetching content:', error);
  }
};
```

### Admin Update
```javascript
const updateContent = async (contentData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:5000/api/plab-content/page/what-is-plab', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contentData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Content updated successfully!');
    }
  } catch (error) {
    console.error('Error updating content:', error);
  }
};
```
