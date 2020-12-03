import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// DONE: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = process.env.JWKS_URL

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.log('token', event.authorizationToken)
  logger.info(`Authorizing a user ${event.authorizationToken}`)
  logger.info(event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info(`VERIFY JWTTOKEN: ${authHeader}`)
  const token = getToken(authHeader)
  logger.info(`JWT TOKEN: ${token}`)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info(`JWT PAYLOAD SUB ${jwt.payload.sub}`)
  logger.info(`JWT PAYLOAD EXP ${jwt.payload.exp}`)
  logger.info(`JWT PAYLOAD ISS ${jwt.payload.iss}`)
  logger.info(`JWT PAYLOAD IAT ${jwt.payload.iat}`)
  logger.info(`JWT HEADER ${jwt.header.alg}`)
  // DONE: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  const jwksApiResponse = await Axios.get(jwksUrl)
  logger.info(`jwks Api Response ${jwksApiResponse.data}`)
  const certificateKeyId = jwksApiResponse.data.keys[0].x5c
  logger.info(`CERTIFICATE ID: ${certificateKeyId}`)
  const certificate = certToPEM(certificateKeyId)

  logger.info(`certificate ${certificate}`)
  //lets verify token
  const verifyTokenResponse = verify(token, certificate, {
    algorithms: [jwt.header.alg]
  }) as JwtPayload

  return verifyTokenResponse
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

// function getCertToPEM(certificate) {
  
//   logger.info(`CERT TO PERM: ${certificate}`)
//   //let certMatch = certificate.match(/.{1,64}/g).join('\n');
  
//   let cert = `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----\n`;
//   logger.info(`CERTIFICATE PERM ${cert}`)
//   return cert;
// }

function certToPEM(cert) {
  logger.info(`match ${cert}`)
  //cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
