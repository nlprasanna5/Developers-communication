<!-- APIS -->

authRouter
- POST /signup
- POST /login
- POST /logout


profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/passowrd.  => forgot password


connectionRequestRouter
- POST /request/send/intereested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

userRouter
- GET /user/connections
- GET /user/requests/received
- GET /user/feed - gets you the profiles of other users on platform
