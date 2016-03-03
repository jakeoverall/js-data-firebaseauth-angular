JS-Data-Firebase-Auth
=====================

I got tired of rewritting Auth for all of my apps, so I wraped everything up needed for simple user creation tied to firebase. 

To utilize this directive simply insert 

```html
<firebase-auth auth="onAuthCallback" unauth="unauthCallback"></firebase-auth>
```

The auth and unauth callback attributes are optional. For a full working demo check out the example. 

Once Authenticated you will have access to the firebase member object will be available through `$rootScope.member`