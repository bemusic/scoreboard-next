# Authentication

## Dev notes

### Authenticate using Auth0

```
POST https://bemuse.au.auth0.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=http://auth0.com/oauth/grant-type/password-realm
&realm=Username-Password-Authentication
&username=<playerId>
&password=<...>
&client_id=XOS0iHs3cwHICkVHwPEJYVHuyyLrETN4
&scope=openid
```

Result will be a JSON object with `id_token`.

```json
{
  "nickname": "19b01549-317d-465f-8f34-277357054b90",
  "name": "tester1@bemuse.ninja",
  "picture": "https://s.gravatar.com/avatar/b67f4c3e2a8acb9b2629ea0de42f9e6c?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fte.png",
  "updated_at": "2022-10-25T07:50:06.845Z",
  "email": "tester1@bemuse.ninja",
  "email_verified": false,
  "iss": "https://bemuse.au.auth0.com/",
  "sub": "auth0|6356ee23284d38dfe27d3e7d",
  "aud": "XOS0iHs3cwHICkVHwPEJYVHuyyLrETN4",
  "iat": 1666684206,
  "exp": 1668757806
}
```

JWKS lives at `https://bemuse.au.auth0.com/.well-known/jwks.json`.

### Authenticate using Auth0

```
POST https://bemuse.au.auth0.com/dbconnections/signup
Content-Type: application/json

{
  "client_id": "XOS0iHs3cwHICkVHwPEJYVHuyyLrETN4",
  "connection": "Username-Password-Authentication",
  "email": "<email>",
  "password": "<password>",
  "username": "<playerId>",
  "user_metadata": {"playerName": "<playerName>"}
}
```

Response

```json
{
  "user_id": "<auth0UserId>",
  "email": "<email>",
  "email_verified": false,
  "username": "<playerId>",
  "nickname": "<playerId>",
  "user_metadata": { "playerName": "BemuseTester3" }
}
```
