import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { generateSignedUrl } from '../../business_logic/attachementImageBloc'

const logger = createLogger('generateUploadUrlHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info(`Generate todoUrl: ${todoId}`)
    try {
      const uploadUrl = await generateSignedUrl(todoId)
      logger.info(``)
      return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl })
      }
    } catch(err) {
      logger.error(err)
      return {
        statusCode: 500,
        body: err.message
      }
    }
  }
)

handler.use(cors({ credentials: true }))
