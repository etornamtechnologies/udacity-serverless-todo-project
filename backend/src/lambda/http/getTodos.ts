import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'

const logger = createLogger('getTodosHandler')

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getToken } from '../../auth/utils'
import { TodoItem } from '../../models/TodoItem'
import { getAllTodosByUserId } from '../../business_logic/todoBloc'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('GetTodosHandler')
    logger.info('Authentication header', event.headers.Authorization)
  // TODO: Get all TODO items for a current user
    try {
      const jwtToken: string = getToken(event.headers.Authorization)
      const todoItems: TodoItem[] = await getAllTodosByUserId(jwtToken)
      
      return {
        statusCode: 200,
        body: JSON.stringify({ items: todoItems })
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
