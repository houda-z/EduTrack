# Testing Guide - MethodNotAllowedHttpException Fix

## Quick Verification

### Test 1: Backend Route Verification
```bash
# In backend directory
php artisan route:list | grep -E "cours|examens|emploi-du-temps"
```

Expected output should show:
```
GET    /api/cours                              CoursController@index
GET    /api/examens                            ExamenController@index  
GET    /api/emploi-du-temps                    EmploiDuTempsController@index
GET    /api/emploi-du-temps/config             EmploiDuTempsController@config
POST   /api/cours                              CoursController@store (enseignant only)
POST   /api/examens                            ExamenController@store (enseignant only)
POST   /api/emploi-du-temps                    EmploiDuTempsController@store (enseignant only)
```

### Test 2: Frontend API Requests (Browser Console)

#### After logging in as a student, try:

```javascript
// Test 1: Fetch courses
const coursesResponse = await fetch(
  'http://localhost:8000/api/cours',
  {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
  }
);
console.log(await coursesResponse.json());

// Test 2: Fetch exams
const examsResponse = await fetch(
  'http://localhost:8000/api/examens',
  {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
  }
);
console.log(await examsResponse.json());

// Test 3: Fetch emploi du temps
const scheduleResponse = await fetch(
  'http://localhost:8000/api/emploi-du-temps?groupe_id=1',
  {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
  }
);
console.log(await scheduleResponse.json());
```

Expected: All should return 200 OK with data

### Test 3: Component Navigation Tests

1. **Student Dashboard Tests**
   - [ ] Navigate to Mes Cours → Should load without errors
   - [ ] Navigate to Examens → Should load without errors
   - [ ] Navigate to Emploi Du Temps → Should load without errors
   - [ ] Navigate to Mes Notes → Should load without errors

2. **Teacher Dashboard Tests**
   - [ ] Navigate to Mes Cours → Should load teacher's courses
   - [ ] Navigate to Examens → Should load teacher's exams
   - [ ] Navigate to Emploi Du Temps → Should load schedule
   - [ ] Create a new course → Should work with POST
   - [ ] Create a new exam → Should work with POST

3. **Admin Dashboard Tests**
   - [ ] Navigate to Dashboard → Should show stats
   - [ ] Check user management → Should load users

### Test 4: Browser Network Tab

1. Open DevTools → Network tab
2. Navigate to MesCours page
3. Look for GET request to `/api/cours`
4. Verify response is 200 OK

Expected sequence:
```
GET /api/user (auth check)
GET /api/cours (fetch courses)
```

### Test 5: Error Scenario (Should NOT see these anymore)

These errors should NO LONGER appear:
```
GET method is not supported for route api/cours. Supported methods: POST
GET method is not supported for route api/examens. Supported methods: POST
GET method is not supported for route api/emploi-du-temps. Supported methods: POST
```

If you still see these:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart backend: `php artisan serve`
3. Run `php artisan route:cache` to clear route cache

### Test 6: Postman/cURL Manual Tests

#### Get Courses
```bash
curl -X GET \
  http://localhost:8000/api/cours \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titre": "Introduction to PHP",
      "description": "...",
      "formateur": {...},
      "...": "..."
    }
  ],
  "message": "Cours récupérés avec succès."
}
```

#### Get Exams
```bash
curl -X GET \
  http://localhost:8000/api/examens \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Get Schedule with Group Filter
```bash
curl -X GET \
  "http://localhost:8000/api/emploi-du-temps?groupe_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Verify POST Still Restricted (Try creating without teacher role)
```bash
curl -X POST \
  http://localhost:8000/api/cours \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Test",
    "filiere_id": 1
  }'
```

Expected Response (403 Forbidden):
```json
{
  "success": false,
  "message": "Action non autorisée."
}
```

## Checklist for Verification

- [ ] No syntax errors in backend/routes/api.php
- [ ] Routes are properly nested inside auth:sanctum middleware
- [ ] GET /cours returns 200 OK with course data
- [ ] GET /examens returns 200 OK with exam data
- [ ] GET /emploi-du-temps returns 200 OK with schedule data
- [ ] Students can GET but not POST to these endpoints
- [ ] Teachers can both GET and POST to these endpoints
- [ ] All frontend pages load without MethodNotAllowedHttpException
- [ ] Browser network tab shows GET requests (not POST)
- [ ] No 405 Method Not Allowed errors

## Debugging Tips

### If you still see MethodNotAllowedHttpException:

1. **Clear all caches:**
   ```bash
   cd backend
   php artisan cache:clear
   php artisan route:cache
   php artisan view:clear
   php artisan config:cache
   ```

2. **Restart both servers:**
   ```bash
   # Terminal 1 - Backend
   php artisan serve
   
   # Terminal 2 - Frontend
   npm start
   ```

3. **Check route list:**
   ```bash
   php artisan route:list | grep -i cours
   ```

4. **Enable debug mode in backend .env:**
   ```
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

5. **Check Laravel logs:**
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

### If frontend still can't fetch data:

1. Verify token is valid: `localStorage.getItem('user_token')`
2. Verify API base URL: Check `REACT_APP_API_URL` in .env
3. Check CORS headers in browser console
4. Verify user role (student/teacher/admin)

## Success Indicators

✅ Student pages load without throwing exceptions
✅ Courses, exams, and schedules display properly
✅ Network tab shows GET requests to /api/cours, /api/examens, /api/emploi-du-temps
✅ No 405 Method Not Allowed errors in console
✅ Teachers can still create new courses/exams
✅ Students cannot create but can view courses/exams

## Additional Resources

- Laravel Routes Documentation: https://laravel.com/docs/routing
- Sanctum Authentication: https://laravel.com/docs/sanctum
- HTTP Methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
