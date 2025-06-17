# Bruno API Collection Documentation

## Overview

This Bruno collection provides comprehensive API testing for the Shabda (शब्द) Nepali Dictionary application. The collection is organized into three main sections: **Public**, **User**, and **Admin** endpoints, each with different authentication requirements.

## 🚀 Quick Start

1. **Install Bruno**: Download from [bruno.com](https://www.bruno.com)
2. **Open Collection**: Open the `bruno` folder in Bruno
3. **Set Environment**: Select the "Shabda" environment
4. **Start Testing**: Begin with public endpoints, then authenticate for user/admin features

## 📁 Collection Structure

```
bruno/
├── get-words.bru           # 🔍 Search words (Public)
├── get-word-by-id.bru      # 📖 Get word by ID (Public)
├── get-random-word.bru     # 🎲 Get random word (Public)
├── user/                    # 👤 User functionality (Auth required)
│   ├── auth/               # 🔐 Authentication
│   │   ├── signup.bru      # Register new user
│   │   ├── signin.bru      # Login with credentials
│   │   └── signout.bru     # Logout
│   ├── profile/            # 👤 Profile management
│   │   └── get-profile.bru # Get user profile
│   └── bookmarks/          # 🔖 Bookmark operations
│       ├── get-bookmarks.bru    # Get user bookmarks
│       ├── add-bookmark.bru     # Add bookmark
│       └── remove-bookmark.bru  # Remove bookmark
├── admin/                   # ⚙️ Admin functionality (Admin auth required)
│   ├── auth/
│   │   └── login.bru       # Admin login
│   └── words/
│       ├── create-word.bru # Create new word
│       ├── update-word.bru # Update word
│       └── delete-word.bru # Delete word
└── environments/
    └── shabda.bru          # 🌍 Environment configuration
```

## 🔧 Environment Variables

Configure these variables in the "Shabda" environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `authToken` | Admin authentication token | `eyJhbGciOiJIUzI1NiIs...` |
| `userAuthToken` | User authentication token | `eyJhbGciOiJIUzI1NiIs...` |

## 📋 API Endpoints

### 🌐 Public Endpoints (No Authentication Required)

#### 1. Search Words
- **File**: `get-words.bru`
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/words`
- **Description**: Search for Nepali words with pagination and filtering
- **Body**:
  ```json
  {
    "search": "नमस्ते",
    "limit": 10,
    "page": 1
  }
  ```

#### 2. Get Word by ID
- **File**: `get-word-by-id.bru`
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/word/{{wordId}}`
- **Description**: Retrieve a specific word by its ID
- **Variables**: Set `wordId` in environment

#### 3. Get Random Word
- **File**: `get-random-word.bru`
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/words/random`
- **Description**: Get a random word from the dictionary

### 👤 User Endpoints (User Authentication Required)

#### Authentication
1. **User Signup** (`user/auth/signup.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/auth/register`
   - **Body**:
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123"
     }
     ```

2. **User Signin** (`user/auth/signin.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/auth/signin/credentials`
   - **Body**:
     ```json
     {
       "email": "john@example.com",
       "password": "password123"
     }
     ```

3. **User Signout** (`user/auth/signout.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/auth/signout`
   - **Auth**: `Bearer {{userAuthToken}}`

#### Profile Management
4. **Get User Profile** (`user/profile/get-profile.bru`)
   - **Method**: `GET`
   - **URL**: `{{baseUrl}}/api/users/profile`
   - **Auth**: `Bearer {{userAuthToken}}`

#### Bookmarks
5. **Get Bookmarks** (`user/bookmarks/get-bookmarks.bru`)
   - **Method**: `GET`
   - **URL**: `{{baseUrl}}/api/bookmarks`
   - **Auth**: `Bearer {{userAuthToken}}`

6. **Add Bookmark** (`user/bookmarks/add-bookmark.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/bookmarks/add`
   - **Auth**: `Bearer {{userAuthToken}}`
   - **Body**:
     ```json
     {
       "wordId": "507f1f77bcf86cd799439011"
     }
     ```

7. **Remove Bookmark** (`user/bookmarks/remove-bookmark.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/bookmarks/remove`
   - **Auth**: `Bearer {{userAuthToken}}`
   - **Body**:
     ```json
     {
       "wordId": "507f1f77bcf86cd799439011"
     }
     ```

### ⚙️ Admin Endpoints (Admin Authentication Required)

#### Authentication
1. **Admin Login** (`admin/auth/login.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/auth/signin/credentials`
   - **Body**:
     ```json
     {
       "email": "admin@example.com",
       "password": "adminpassword"
     }
     ```

#### Word Management
2. **Create Word** (`admin/words/create-word.bru`)
   - **Method**: `POST`
   - **URL**: `{{baseUrl}}/api/word/create`
   - **Auth**: `Bearer {{authToken}}`
   - **Body**:
     ```json
     {
       "word": "नमस्ते",
       "romanized": "namaste",
       "english": "hello",
       "definitions": [
         {
           "grammar": "noun",
           "etymology": "Sanskrit नमस्ते",
           "senses": {
             "nepali": ["अभिवादन"],
             "english": ["greeting"]
           },
           "examples": {
             "nepali": ["नमस्ते भन्नुहोस्"],
             "english": ["Say hello"]
           },
           "synonyms": {
             "nepali": ["स्वागत"],
             "english": ["hi"]
           },
           "antonyms": {
             "nepali": ["अलविदा"],
             "english": ["goodbye"]
           }
         }
       ]
     }
     ```

3. **Update Word** (`admin/words/update-word.bru`)
   - **Method**: `PUT`
   - **URL**: `{{baseUrl}}/api/word/update?id={{wordId}}`
   - **Auth**: `Bearer {{authToken}}`
   - **Variables**: Set `wordId` in environment

4. **Delete Word** (`admin/words/delete-word.bru`)
   - **Method**: `DELETE`
   - **URL**: `{{baseUrl}}/api/word/delete?id={{wordId}}`
   - **Auth**: `Bearer {{authToken}}`
   - **Variables**: Set `wordId` in environment

## 🔐 Authentication Workflow

### For Users:
1. **Signup**: Create a new account using `user/auth/signup.bru`
2. **Signin**: Login using `user/auth/signin.bru`
3. **Get Token**: Copy the session token from the response
4. **Set Token**: Update `userAuthToken` in environment variables
5. **Use User Endpoints**: All user endpoints will now work

### For Admins:
1. **Login**: Use `admin/auth/login.bru` with admin credentials
2. **Get Token**: Copy the session token from the response
3. **Set Token**: Update `authToken` in environment variables
4. **Use Admin Endpoints**: All admin endpoints will now work

## 📝 Testing Workflows

### Basic User Testing:
1. Test public endpoints (search, get word, random)
2. Signup a new user
3. Signin with the user
4. Test profile and bookmark functionality
5. Signout

### Admin Testing:
1. Login as admin
2. Create a new word
3. Update the word
4. Delete the word
5. Verify changes

### Full Integration Testing:
1. Create a word as admin
2. Search for the word as public user
3. Signup/signin as regular user
4. Bookmark the word
5. View bookmarks
6. Remove bookmark
7. Delete word as admin

## 🛠️ Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check if authentication token is set correctly
   - Verify token hasn't expired
   - Ensure you're using the right token (user vs admin)

2. **403 Forbidden**
   - Verify you have the correct role (user vs admin)
   - Check if the endpoint requires admin privileges

3. **404 Not Found**
   - Verify the word ID exists
   - Check if the API endpoint URL is correct

4. **400 Bad Request**
   - Validate request body format
   - Check required fields are present
   - Verify data types are correct

### Environment Setup:
- Ensure `baseUrl` points to your running server
- Set authentication tokens after successful login
- Use separate tokens for user and admin operations

## 📚 Best Practices

1. **Start with Public Endpoints**: Test basic functionality first
2. **Use Environment Variables**: Don't hardcode URLs or tokens
3. **Test Authentication Flow**: Always test login/logout sequences
4. **Validate Responses**: Check response status codes and data
5. **Clean Up**: Remove test data after testing
6. **Document Changes**: Update this documentation when adding new endpoints

## 🔄 Version History

- **v1.0**: Initial collection with public, user, and admin endpoints
- **v1.1**: Added comprehensive documentation and authentication workflows
- **v1.2**: Organized endpoints by access level and functionality

---

*This collection is designed for testing the Shabda Nepali Dictionary API. For more information about the project, see the main README.md file.* 