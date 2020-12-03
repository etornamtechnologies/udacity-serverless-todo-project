// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'lvaauhqst1'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // DONE: Create an Auth0 application and copy values from it into this map
  domain: 'dev-b7rcqjet.us.auth0.com',            // Auth0 domain
  clientId: 'p7153p4f11T3pj5BEiJRCWSZEqWlClyD',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
